# ============================================================
# variables.tf — Tekrar eden değerler (tek yerden yönet)
# ============================================================

variable "location" {
  description = "Azure bölgesi"
  type        = string
  default     = "westeurope"  # sana yakın bölge
}

variable "resource_group_name" {
  description = "Ana kaynakların resource group'u (ACR, AKS buraya)"
  type        = string
  default     = "snapvault-rg"
}

variable "acr_name" {
  description = "Azure Container Registry adı (global benzersiz, harf+rakam)"
  type        = string
  default     = "snapvaultacr"
}

variable "aks_name" {
  description = "AKS cluster adı"
  type        = string
  default     = "snapvault-aks"
}

variable "node_count" {
  description = "AKS node (sunucu) sayısı"
  type        = number
  default     = 1            # tek node - öğrenme için yeterli, ekonomik
}

variable "node_vm_size" {
  description = "AKS node'larının VM boyutu"
  type        = string
  default     = "Standard_B2s"  # küçük, ucuz VM (2 vCPU, 4GB RAM)
}
