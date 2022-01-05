import { Component, OnInit } from '@angular/core';
import {CartService} from "../../services/cart.service";
import {CartModelServer} from "../../models/cart.model";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  cartData: CartModelServer;
  cartTotal: number;

  constructor(public cartService: CartService) { }

  ngOnInit(): void {

    this.cartService.cartTotal$.subscribe(total => {
      this.cartTotal = total;
    });
  
    this.cartService.cartData$.subscribe(data => this.cartData = data);
  }

  
  

}
