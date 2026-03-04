/*
    BikeParts.cs

    This model represents a single bike component stored in the database.
    Each part belongs to a specific bike type (Enduro, DH, or DJ) identified
    by BikeTypeId, and is categorised by PartType (e.g. "frame", "fork").
    The ImagePath and ThumbnailPath fields store relative paths used by the
    front end to load the full-size and thumbnail preview images respectively.
    This table is the source of truth for all parts data, which is exported
    to JSON files on startup for efficient front-end access.
*/

using BikeBuilderAPI.Model;

namespace BikeBuilderAPI.Models
{
    public class BikeParts
    {
        public int Id { get; set; }             // Primary key, uniquely identifies each part
        public int BikeTypeId { get; set; }     // Foreign key linking part to a bike type (1=Enduro, 2=DH, 3=DJ)
        public string PartType { get; set; }    // Category of part (e.g. "frame", "fork", "wheels")
        public string Name { get; set; }        // Display name shown in the builder UI
        public string Description { get; set; } // Short description shown in the part selection panel
        public string ImagePath { get; set; }   // Relative path to the full-size layered bike preview image
        public string ThumbnailPath { get; set; } // Relative path to the thumbnail shown in the selection panel
        public decimal Price { get; set; }      // Cost of the part in GBP, used for total price calculations
        public decimal Weight { get; set; }     // Weight of the part in grams, used for total weight calculations
    }
}