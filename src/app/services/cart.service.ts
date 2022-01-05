import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartModelPublic, CartModelServer } from '../models/cart.model';
import { ProductModelServer, ServerResponse } from '../models/product.model';
import { OrderService } from './order.service';
import { ProductService } from './product.service';


@Injectable({
  providedIn: 'root'
})
export class CartService {

    private serverUrl = environment.SERVER_URL;


    /**Data variable to store the cart information on the client's local storage */
    private cartDataClient: CartModelPublic = {prodData: [{incart: 0,id: 0}], total: 0} 

    /**Data variable to store cart information on the server  */

    private cartDataServer: CartModelServer = {data:[{numInCart: 0,product: undefined}], total: 0}

    /**Observables for the component to subscribe */
    cartTotal$ = new BehaviorSubject<number>(0);
    cartData$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);

  constructor(private http : HttpClient, 
    public productService: ProductService, 
    public orderService: OrderService, 
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService) { 

    this.cartTotal$.next(this.cartDataServer.total);
    this.cartData$.next(this.cartDataServer);

    // Get the informations from local storage ( if any )

    const info: CartModelPublic = JSON.parse(localStorage.getItem('cart'));

    // Check if the info variable is null or have data 

    if (info !== null && info !== undefined && info.prodData[0].incart !== 0){
        // local storage is not empty and have some information
        this.cartDataClient = info;
        // loop through each entry and put it in the cartDataSever Object
        this.cartDataClient.prodData.forEach(p => {
            console.log("test prodID: ", p.id);
            this.productService.getSingleProduct(p.id).subscribe((actualProdInfo: ProductModelServer) => {
              if (this.cartDataServer.data[0].numInCart === 0) {
                this.cartDataServer.data[0].numInCart = p.incart;
                this.cartDataServer.data[0].product = actualProdInfo;
                // TODO create calculateTotal function here and replace it
                this.calculateTotal();
                this.cartDataClient.total = this.cartDataServer.total;
                localStorage.setItem('cart',JSON.stringify(this.cartDataClient));
              }
              else {
                //CartDataServer already have info in it 
                this.cartDataServer.data.push({
                    numInCart: p.incart,
                    product: actualProdInfo
                  });
                // TODO create calculateTotal function here and replace it
                this.calculateTotal();
                this.cartDataClient.total = this.cartDataServer.total;
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
              }
              this.cartData$.next({...this.cartDataServer});
            });
        });
    }
    }

    CalculateSubTotal(index): number {
        let subTotal = 0;
    
        let p = this.cartDataServer.data[index];
        // @ts-ignore
        subTotal = p.product.price * p.numInCart;
    
        return subTotal;
    }

    // addProductToCart(id: number, quantity?: number){

    //     console.log(id);
    //     this.productService.getSingleProduct(id).subscribe(prod => {
    //         console.log(this.cartDataServer.data[0].product);
    //         // if the cart is empty
    //         if (this.cartDataServer.data[0].product === undefined){

    //             console.log("i'm here");
    //             this.cartDataServer.data[0].product = prod;
    //             console.log(this.cartDataServer.data[0].product);
    //             this.cartDataServer.data[0].numInCart = quantity !== undefined ? quantity : 1;
    //             console.log(this.cartDataServer.data[0].numInCart);
    //             //TODO calculate total amount 
    //             this.calculateTotal();
    //             this.cartDataClient.prodData[0].incart = this.cartDataServer.data[0].numInCart;
    //             this.cartDataClient.prodData[0].id = prod.id;
    //             this.cartDataClient.total = this.cartDataServer.total;
    //             localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
    //             this.cartData$.next({...this.cartDataServer});
    //             //TODO Display taost notification
                
    //             this.toast.success(`${prod.name} added to the cart`, "Product Added",{
    //                 timeOut: 1500,
    //                 progressBar: true,
    //                 progressAnimation: 'increasing',
    //                 positionClass: 'toast-top-right'
    //             });
    //         }// End of IF

    //         // if the cart has an item
    //         else {
    //             console.log("i'm here 2");
    //             let index = this.cartDataServer.data.findIndex(p => p.product.id === prod.id); // -1 or positive value

    //             console.log(index);
    //             // a. if item is already in the cart => index is positive 

    //             if (index !== -1){
    //                 if (quantity !== undefined && quantity <= prod.quantity){
    //                     // @ts-ignore
    //                     this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? quantity : prod.quantity;
    //                     console.log(this.cartDataServer.data[index].numInCart);
    //                 }
    //                 else {
    //                     // @ts-ignore
    //                     this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? this.cartDataServer.data[index].numInCart++ : prod.quantity;
    //                     console.log(this.cartDataServer.data[index].numInCart);
    //                 }

    //                 this.cartDataClient.prodData[index].incart = this.cartDataServer.data[index].numInCart;
    //                 console.log(this.cartDataClient.prodData[index].incart);

    //                 this.calculateTotal();
    //                 console.log(this.calculateTotal());
    //                 this.cartDataClient.total = this.cartDataServer.total;
    //                 console.log(this.cartDataClient.total);

    //                 localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
    //                 console.log(this.cartDataClient);
    //                 //TODO Display taost notification 
    //                 this.toast.info(`${prod.name} quantity updated in the cart`, "Product Updated",{
    //                     timeOut: 1500,
    //                     progressBar: true,
    //                     progressAnimation: 'increasing',
    //                     positionClass: 'toast-top-right'
    //                 })
                    
    //             }
    //             // b. if item is not in the cart 
    //             else {
    //                 this.cartDataServer.data.push({
    //                     numInCart: 1, 
    //                     product: prod
    //                 });
    //                 this.cartDataClient.prodData.push({
    //                     incart: 1,
    //                     id: prod.id
    //                 });
    //             //TODO Display taost notification 
    //             localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
    //             this.toast.success(`${prod.name} added to the cart`, 'Product Added',{
    //                 timeOut: 1500,
    //                 progressBar: true,
    //                 progressAnimation: 'increasing',
    //                 positionClass: 'toast-top-right'

    //             });

    //             //TODO calculate total amount 

    //             this.calculateTotal();
    //             this.cartDataClient.total = this.cartDataServer.total;
    //             localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
    //             this.cartData$.next({...this.cartDataServer});
    //             } 
    //         }
    //     });   
    // }

    

    AddProductToCart(id: number, quantity?: number) {

        

            

        this.productService.getSingleProduct(id).subscribe((prod) => {
          // If the cart is empty
          console.log("prod id before test: ",prod.name);
          if (this.cartDataServer.data[0].product === undefined) {
            console.log("Cart is empty --- ", this.cartDataServer.data[0].product);
            this.cartDataServer.data[0].product = prod;
            console.log("test product : ", prod);// produit
            this.cartDataServer.data[0].numInCart = quantity !== undefined ? quantity : 1;
            console.log("quantity :",this.cartDataServer.data[0].numInCart); // numInCart
            this.calculateTotal();
            this.cartDataClient.prodData[0].incart = this.cartDataServer.data[0].numInCart;
            console.log("NumInCart", this.cartDataClient.prodData[0].incart);
            this.cartDataClient.prodData[0].id = prod.id;
            console.log("id product: ", prod.id);
            this.cartDataClient.total = this.cartDataServer.total;
            console.log("total :", this.cartDataClient.total);
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            this.cartData$.next({...this.cartDataServer});
            this.toast.success(`${prod.name} added to the cart.`, "Product Added", {
              timeOut: 1500,
              progressBar: true,
              progressAnimation: 'increasing',
              positionClass: 'toast-top-right'
            })
          }  // END of IF
          // Cart is not empty
          else {
            console.log("Cart is not empty");

            let index = this.cartDataServer.data.findIndex(p => p.product.id === prod.id);
    
            // 1. If chosen product is already in cart array
            if (index !== -1) {
    
              if (quantity !== undefined && quantity <= prod.quantity) {
                // @ts-ignore
                this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? quantity : prod.quantity;
              } else {
                // @ts-ignore
                this.cartDataServer.data[index].numInCart < prod.quantity ? this.cartDataServer.data[index].numInCart++ : prod.quantity;
              }
    
    
              this.cartDataClient.prodData[index].incart = this.cartDataServer.data[index].numInCart;
              this.toast.info(`${prod.name} quantity updated in the cart.`, "Product Updated", {
                timeOut: 1500,
                progressBar: true,
                progressAnimation: 'increasing',
                positionClass: 'toast-top-right'
              })
            }
            // 2. If chosen product is not in cart array
            else {
              this.cartDataServer.data.push({
                product: prod,
                numInCart: 1
              });
              this.cartDataClient.prodData.push({
                incart: 1,
                id: prod.id
              });
              console.log("product id: ",prod.id);
              this.toast.success(`${prod.name} added to the cart.`, "Product Added", {
                timeOut: 1500,
                progressBar: true,
                progressAnimation: 'increasing',
                positionClass: 'toast-top-right'
              })
            }
            this.calculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            this.cartData$.next({...this.cartDataServer});
          }  // END of ELSE
    
    
        });
      }

    updateCartItems(index: number, increase: boolean){
        let data = this.cartDataServer.data[index];
        if (increase){
            // @ts-ignore
            data.numInCart < data.product.quantity ? data.numInCart++ : data.product.quantity;
            this.cartDataClient.prodData[index].incart = data.numInCart;
            //TODO calculate total amount 
            this.calculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            this.cartData$.next({...this.cartDataServer});
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));

        }else {
            // @ts-ignore
            data.numInCart--;

            // @ts-ignore
            if (data.numInCart < 1){
                // TODO Delete product from cart 
                this.deleteProductFromCart(index);
                this.cartData$.next({...this.cartDataServer});
            }else {
                // @ts-ignore
                this.cartData$.next({...this.cartDataServer});
                this.cartDataClient.prodData[index].incart = data.numInCart;
                //TODO calculate total amount 
                this.calculateTotal();
                this.cartDataClient.total = this.cartDataServer.total;
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            }
        }
    }

    deleteProductFromCart(index: number){
        if (window.confirm('Are you sure you want to remove the item ?')){
            this.cartDataServer.data.splice(index,1);
            this.cartDataClient.prodData.splice(index,1);
            // TODO Calculate total amount 
            this.cartDataClient.total = this.cartDataServer.total;

            if (this.cartDataClient.total === 0 ){
                this.cartDataClient = {
                    total:0,
                    prodData: [{
                        incart: 0,
                        id: 0
                    }]
                }
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));

            }
            else {
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            }

            if (this.cartDataServer.total === 0){
                this.cartDataServer = {
                    total:0,
                    data:[{
                        numInCart:0,
                        product: undefined
                    }]
                }
                localStorage.setItem('cart', JSON.stringify(this.cartDataServer));
            }
            else {
                localStorage.setItem('cart', JSON.stringify(this.cartDataServer));
            }

        } 
        else {
            // IF the user clicks cancel button 
            return;
        }

    }

    private calculateTotal(){
        let Total = 0; 

        this.cartDataServer.data.forEach(p => {
            const{numInCart} = p;
            console.log(numInCart);
            const {price} = p.product;

            console.log(p.product.price);

            Total += numInCart * price;
            console.log(Total);
        });
        
        //console.log(parseInt(Total));
        this.cartDataServer.total = Total;
        console.log(this.cartDataServer.total);
        this.cartTotal$.next(this.cartDataServer.total);
    }

    checkOutFromCart(userId: number){

        this.http.post(`${this.serverUrl}/orders/payment`,null).subscribe((res: { success: boolean})=> {

            if(res.success){

                this.resetServerData();
                this.http.post(`${this.serverUrl}/orders/new`, {
                    userId: userId,
                    products: this.cartDataClient.prodData
                }).subscribe((data:OrderResponse) => {

                    this.orderService.getSingleOrder(data.order_id).then(prods => {
                        if(data.success){
                            //create navigation extra 
                            const navigationExtras: NavigationExtras = {
                                state: {
                                    message: data.message,
                                    product : prods,
                                    orderId: data.order_id,
                                    total : this.cartDataClient.total
                                }
                            }
                                // TODO HIDE SPINNER

                                this.spinner.hide().then();

                                this.router.navigate(['/thankyou'],navigationExtras).then(p => {
                                    this.cartDataClient = {
                                        total:0,
                                        prodData: [{
                                            incart: 0,
                                            id: 0
                                        }]
                                    }
                                    this.cartTotal$.next(0);
                                    localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
                                });
                        }
                    })
                })
            }else {
                this.spinner.hide().then();
                this.router.navigateByUrl('/checkout').then();
                this.toast.error(`Sorry, failed to book the order`, 'Order Status',{
                    timeOut: 1500,
                    progressBar: true,
                    progressAnimation: 'increasing',
                    positionClass: 'toast-top-right'

                });
            }
        });
    }

    private resetServerData(){
        this.cartDataServer = {
            total:0,
            data:[{
                numInCart:0,
                product: undefined
            }]
        }
        this.cartData$.next({...this.cartDataServer});
    }
}

interface OrderResponse{
    order_id : number;
    success: boolean;
    message: string;
    products: [{
        id: string,
        numInCart: string
    }]
}