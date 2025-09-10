using BikeBuilderAPI.Model;

namespace BikeBuilderAPI.Models
{
    public class Reviews
    {
        public int ReviewId { get; set; }
        public int BikePartID { get; set; }
        public string Username { get; set; }
        public int Rating { get; set; }
        public string Description { get; set; }

    }

}