# ============================================================
# outputs.tf — Oluşturma sonrası bize lazım olan bilgiler
# ============================================================
# Terraform apply bitince bunları ekrana yazar.

output "acr_login_server" {
  description = "ACR'ın adresi (image push ederken kullanılır)"
  value       = azurerm_container_registry.acr.login_server
  # örn: snapvaultacr.azurecr.io
}

output "resource_group_name" {
  description = "Ana resource group adı"
  value       = azurerm_resource_group.main.name
}

output "aks_name" {
  description = "AKS cluster adı (kubectl bağlanırken lazım)"
  value       = azurerm_kubernetes_cluster.aks.name
}
