/*
    SavedBike.cs

    This model represents a saved bike configuration in the database.
    Each record stores all twelve selected part IDs, the bike type, the
    account it belongs to, and the timestamp of when it was saved.
    The Account navigation property defines the many-to-one relationship
    back to the Account model, allowing Entity Framework to resolve the
    owning account from a saved bike record. SavedAt defaults to the
    current UTC time so the timestamp is always set without requiring
    the caller to supply it.
*/

using BikeBuilderAPI.Model;

namespace BikeBuilderAPI.Models
{
    public class SavedBike
    {
        public int Id { get; set; }         // Primary key, auto-assigned by the database
        public int BikeType { get; set; }   // Numeric bike type (1=Enduro, 2=Downhill, 3=Dirt Jumper)

        // Each field stores the ID of the selected part from the BikeParts table
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

        // Automatically set to the current UTC time when the record is created
        public DateTime SavedAt { get; set; } = DateTime.UtcNow;

        //link bike to user
        public int AccountId { get; set; }      // Foreign key linking this saved bike to its owner account
        public Account Account { get; set; }    // Navigation property allowing EF Core to load the owning account
    }
}