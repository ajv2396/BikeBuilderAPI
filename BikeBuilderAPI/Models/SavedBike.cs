using BikeBuilderAPI.Model;

namespace BikeBuilderAPI.Models
{
    public class SavedBike
    {
        public int Id { get; set; }

        public int BikeType { get; set; }
        public int Frame { get; set; }
        public int Shock { get; set; }
        public int Fork { get; set; }
        public int Wheels { get; set; }
        public int Tyres { get; set; }
        public int Drivetrain { get; set; }
        public int Brakes { get; set; }
        public int Seatpost { get; set; }
        public int Saddle { get; set; }
        public int Bars { get; set; }
        public int Stem { get; set; }
        public int Pedals { get; set; }

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;

        //link bike to user
        public int AccountId { get; set; }
        public Account Account { get; set; }
    }

}
