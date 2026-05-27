import { Injectable } from '@angular/core';
import { ProductSpecs,Product,RoomSlide } from '../components/models/models';
import productsData from '../data/product.json';
import  roomData from '../data/roomslide.json';

@Injectable({ providedIn: 'root' })
export class ProductService {
private products: Product[] = productsData;
  readonly roomSlides: RoomSlide[]=roomData;
  getAll(): Product[] { 
    return [
      ... this.products
    ];
  }

  getFeatured(): Product[] { return this.products.slice(0, 8); }

  getById(id: number): Product | undefined { return this.products.find(p => p.id === id); }

  getRelated(id: number, count = 4): Product[] {
    return this.products.filter(p => p.id !== id).slice(0, count);
  }

  getSpecs(product: Product): ProductSpecs {
    const base: Record<string, ProductSpecs> = {
      Sofa: {
        salesPackage: '1 Sectional Sofa', modelNumber: `FURN-${product.sku}`, secondaryMaterial: 'Solid Wood',
        configuration: 'L-shaped', upholsteryMaterial: 'Fabric + Cotton', upholsteryColor: 'Bright Grey & Lion',
        fillingMaterial: 'Foam', finishType: 'Bright Grey & Lion', adjustableHeadrest: 'No',
        maxLoadCapacity: '280 KG', originOfManufacture: 'India',
        width: '265.32 cm', height: '76 cm', depth: '167.76 cm', weight: '45 KG', seatHeight: '41.52 cm', legHeight: '5.46 cm',
        warrantySummary: '1 Year Manufacturing Warranty', warrantyServiceType: 'For Warranty Claims contact support@furniro.com',
        coveredInWarranty: 'Warranty Against Manufacturing Defect',
        notCoveredInWarranty: 'The Warranty Does Not Cover Damages Due To Usage Of The Product Beyond Its Intended Use And Wear & Tear In The Normal Course Of Product Usage.',
        domesticWarranty: '1 Year',
      },
      Chair: {
        salesPackage: '1 Chair', modelNumber: `FURN-${product.sku}`, secondaryMaterial: 'Plywood',
        configuration: 'Standard', upholsteryMaterial: 'Leather', upholsteryColor: 'Natural Brown',
        fillingMaterial: 'High-Density Foam', finishType: 'Matte', adjustableHeadrest: 'Yes',
        maxLoadCapacity: '120 KG', originOfManufacture: 'India',
        width: '72 cm', height: '88 cm', depth: '78 cm', weight: '12 KG', seatHeight: '46 cm', legHeight: '8 cm',
        warrantySummary: '2 Year Manufacturing Warranty', warrantyServiceType: 'For Warranty Claims contact support@furniro.com',
        coveredInWarranty: 'Warranty Against Manufacturing Defect',
        notCoveredInWarranty: 'Normal wear and tear, accidental damage, misuse.',
        domesticWarranty: '2 Years',
      },
    };
    const cat = product.category as keyof typeof base;
    const defaults: ProductSpecs = {
      salesPackage: `1 ${product.category}`, modelNumber: `FURN-${product.sku ?? product.id}`,
      secondaryMaterial: 'Solid Wood', configuration: 'Standard', upholsteryMaterial: 'Fabric',
      upholsteryColor: 'Grey', fillingMaterial: 'Foam', finishType: 'Matte',
      adjustableHeadrest: 'No', maxLoadCapacity: '150 KG', originOfManufacture: 'India',
      width: '100 cm', height: '80 cm', depth: '60 cm', weight: '20 KG', seatHeight: '45 cm', legHeight: '10 cm',
      warrantySummary: '1 Year Manufacturing Warranty', warrantyServiceType: 'Contact support@furniro.com',
      coveredInWarranty: 'Manufacturing Defects', notCoveredInWarranty: 'Normal wear and tear',
      domesticWarranty: '1 Year',
    };
    return base[cat] ?? defaults;
  }

  formatPrice(price: number): string {
    return 'Rp ' + price.toLocaleString('id-ID');
  }
}
