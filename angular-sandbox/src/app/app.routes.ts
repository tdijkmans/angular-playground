import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { ColorsComponent } from './pages/colors/colors.component';
import { ColorDetailComponent } from './pages/color-detail/color-detail.component';
import { SizesComponent } from './pages/sizes/sizes.component';
import { SizeDetailComponent } from './pages/size-detail/size-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        component: ProductsComponent,
        data: { breadcrumb: 'Products' },
        children: [
          {
            path: ':id',
            component: ProductDetailComponent,
            data: { breadcrumb: null, breadcrumbParam: 'id', breadcrumbResource: 'product' },
            children: [
              {
                path: 'colors',
                component: ColorsComponent,
                data: { breadcrumb: 'Colors' },
                children: [
                  {
                    path: ':colorId',
                    component: ColorDetailComponent,
                    data: { breadcrumb: null, breadcrumbParam: 'colorId', breadcrumbResource: 'color' },
                    children: [
                      {
                        path: 'sizes',
                        component: SizesComponent,
                        data: { breadcrumb: 'Sizes' },
                        children: [
                          {
                            path: ':sizeId',
                            component: SizeDetailComponent,
                            data: { breadcrumb: null, breadcrumbParam: 'sizeId', breadcrumbResource: 'size' },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
