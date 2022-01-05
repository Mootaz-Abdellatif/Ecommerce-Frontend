import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { ProductModelServer, ServerResponse } from 'src/app/models/product.model';
import { CartService } from 'src/app/services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  products: ProductModelServer[] = [];

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private toast: ToastrService
    ) { }

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe(
      (prods: ServerResponse)  => {
        this.products = prods.products;
        console.log("produit: ",this.products);
      }
    )
  }
  selectProduct(id: number){
    this.router.navigate(['/product',id]).then(); 


  }
  addProduct(id: number){
    
    this.cartService.AddProductToCart(id);
  }


}
