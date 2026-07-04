# ============================================================
# provider.tf — Terraform'un temel yapılandırması
# ============================================================

terraform {
  # Hangi provider'ları (eklentileri) kullanıyoruz?
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"  # Azure resmi provider'ı
      version = "~> 4.0"             # 4.x sürümü (~> = "4.x içinde en güncel")
    }
  }

  # ----- REMOTE STATE (senin storage account'unda) -----
  # Terraform'un hafızası (state) burada tutulacak.
  # Böylece hem senin Mac'in hem GitHub Actions aynı state'e erişir.
  backend "azurerm" {
    resource_group_name  = "tf-state-sa-rg"   # state storage'ın resource group'u
    storage_account_name = "omerstfstates"    # state storage account'un
    container_name       = "tfstate"          # oluşturduğumuz container
    key                  = "snapvault.tfstate" # state dosyasının adı (container içinde)
  }
}

# Azure provider'ını etkinleştir
provider "azurerm" {
  features {}  # zorunlu boş blok (Azure provider bunu ister)
}
