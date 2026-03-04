/*
    Order.cs

    This model represents a placed order in the database.
    Each order is linked to a user account by AccountID and stores the
    total price, a generated order number, the date it was placed, and
    an estimated delivery date. The nullable DateTime fields allow EF Core
    to store null before these values are set, though in practice they are
    always assigned by OrdersController before the record is saved.
*/

using BikeBuilderAPI.Model;

namespace BikeBuilderAPI.Models
{
    public class Order
    {
        public int OrderID { get; set; }            // Primary key, auto-assigned by the database
        public int AccountID { get; set; }          // Foreign key linking this order to a user account
        public string? OrderNumber { get; set; }    // Human-readable order reference (e.g. "MTB-2025-AB12CD"), nullable until assigned
        public double TotalPrice { get; set; }      // Total cost of the order in GBP
        public DateTime? CreatedAt { get; set; }    // Timestamp of when the order was placed (UTC)
        public DateTime? EstimatedDeliveryDate { get; set; } // Calculated as 7 days after CreatedAt by OrdersController
    }
}