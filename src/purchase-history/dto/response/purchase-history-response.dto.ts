export class PurchaseHistoryResponseDto {
  _id: string;
  buyer_id: string;
  seller_id: string;
  marketplace_item_id: string;
  price: number;
  purchased_at: Date;
  item?: any;

  constructor(data: any) {
    this._id = data._id?.toString();
    this.buyer_id = data.buyer_id?.toString();
    this.seller_id = data.seller_id?.toString();
    this.marketplace_item_id = data.marketplace_item_id?._id?.toString() || data.marketplace_item_id?.toString();
    this.price = data.price;
    this.purchased_at = data.purchased_at;
    // Include populated marketplace item details
    if (data.marketplace_item_id && typeof data.marketplace_item_id === 'object') {
      this.item = data.marketplace_item_id;
    }
  }
}
