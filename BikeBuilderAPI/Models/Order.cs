using BikeBuilderAPI.Model;

namespace BikeBuilderAPI.Models
{
    public class Order
    {
        public int OrderID { get; set; }

        public int AccountID { get; set; }

        public string? OrderNumber { get; set; }

        public double TotalPrice { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? EstimatedDeliveryDate { get; set; }
    }


}