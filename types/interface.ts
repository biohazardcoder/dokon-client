export interface User {
    phoneNumber: number
    firstName: string,
    lastName: string
    password: string
    avatar: string
    _id:string
    products:[Product]
}
export interface Product{
        productId :string,
        date : string,
        product: string,
        price: number , 
        size: string,
        stock: number
        quantity?:number | undefined
        _id :string
}
export interface Partner {
        admin:string
        shopName: string
        address: string
        phoneNumber: string
        photos: [],
        status:string
        color:string
        products: [],
        _id:string,
        createdAt:string,
        updatedAt:string,
        
}
export interface PartnerProduct{
        admin:string
        date:string
        productId:string
        purchasedQuantity:number
        _id:string
}