using BikeBuilderAPI.Model;
using BikeBuilderAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;

namespace BikeBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BikesController : ControllerBase
    {
        private readonly AccountsContext _db;

        public BikesController(AccountsContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> SaveBike([FromBody] BikeModel bike)
        {
            Console.WriteLine($"Saving bike: Account Id = {bike.AccountId} Bike Type = {bike.BikeType} Frame={bike.Frame}, Shock={bike.Shock}, Fork={bike.Fork}, Wheels={bike.Wheels}, Tyres={bike.Tyres}, Drivetrain={bike.Drivetrain}, Seatpost={bike.Seatpost}, Saddle={bike.Saddle}, Bars={bike.Bars}, Stem={bike.Stem}, Pedals={bike.Pedals}");

            if (bike.AccountId == 0)
            {
                return BadRequest("Missing Account ID");
            }
            var NewBike = new SavedBike
            {
                AccountId = bike.AccountId,
                BikeType = bike.BikeType,
                Frame = bike.Frame,
                Shock = bike.Shock,
                Fork = bike.Fork,
                Wheels = bike.Wheels,
                Tyres = bike.Tyres,
                Drivetrain = bike.Drivetrain,
                Brakes = bike.Brakes,
                Seatpost = bike.Seatpost,
                Saddle = bike.Saddle,
                Bars = bike.Bars,
                Stem = bike.Stem,
                Pedals = bike.Pedals
            };

            _db.SavedBikes.Add(NewBike);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Bike saved.", bikeId = NewBike.Id });
        }

        public class BikeModel
        {
            public int AccountId { get; set; }
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
        }
    }
}
