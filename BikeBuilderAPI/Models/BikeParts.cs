using BikeBuilderAPI.Model;

namespace BikeBuilderAPI.Models
{
    public class BikeParts
    {
        public int Id { get; set; }
        public int BikeTypeId { get; set; } 
        public string PartType { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImagePath { get; set; }
        public string ThumbnailPath { get; set; }
        public decimal Price { get; set; }
    }

}
