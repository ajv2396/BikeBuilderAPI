using BikeBuilderAPI.Model;

namespace BikeBuilderAPI.Models
{
    public class SavedBike
    {
        public int Id { get; set; }

        public string BikeType { get; set; }
        public string Frame { get; set; }
        public string Shock { get; set; }
        public string Fork { get; set; }
        public string Wheels { get; set; }
        public string Tyres { get; set; }
        public string Drivetrain { get; set; }
        public string Brakes { get; set; }
        public string Seatpost { get; set; }
        public string Saddle { get; set; }
        public string Bars { get; set; }
        public string Stem { get; set; }
        public string Pedals { get; set; }

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;

        //link bike to user
        public int AccountId { get; set; }
        public Account Account { get; set; }
    }

}
