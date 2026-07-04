# ============================================================
# main.tf — Asıl Azure kaynakları
# ============================================================

# ----- 1. RESOURCE GROUP -----
# Tüm kaynakları (ACR, AKS) içine koyduğumuz "kutu".
# Silmek istersen, bu group'u silince içindeki her şey gider.
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name  # variables.tf'ten
  location = var.location
}

# ----- 2. AZURE CONTAINER REGISTRY (ACR) -----
# Docker image'larımızı buraya push edeceğiz.
resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.main.name    # yukarıdaki RG'ye bağla
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"   # en ucuz katman - öğrenme için yeterli
  admin_enabled       = true      # kullanıcı adı/şifre ile erişim (başlangıç için kolay)
}

# ----- 3. AKS (Azure Kubernetes Service) -----
# Kubernetes cluster'ımız. Uygulamayı burada çalıştıracağız.
resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.aks_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  dns_prefix          = "snapvault"   # cluster'ın DNS öneki

  # Node havuzu - cluster'ı çalıştıran sanal makineler
  default_node_pool {
    name       = "default"
    node_count = var.node_count       # kaç sunucu (biz: 1)
    vm_size    = var.node_vm_size      # VM boyutu (biz: küçük/ucuz)
  }

  # Cluster'ın kimliği - Azure kaynaklarına erişim için
  identity {
    type = "SystemAssigned"  # Azure otomatik bir kimlik oluşturur
  }
}

# ----- 4. ACR'ı AKS'e BAĞLA (kritik!) -----
# AKS'in ACR'dan image çekebilmesi (pull) için yetki veriyoruz.
# Bu olmadan AKS, ACR'daki image'lara erişemez.
resource "azurerm_role_assignment" "aks_acr_pull" {
  principal_id                     = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"   # "image çekebilir" rolü
  scope                            = azurerm_container_registry.acr.id
  skip_service_principal_aad_check = true
}
