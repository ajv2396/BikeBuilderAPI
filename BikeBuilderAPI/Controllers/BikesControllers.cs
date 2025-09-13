using BikeBuilderAPI.Model;
using BikeBuilderAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;
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

        [HttpPost("save-bike")]
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
        }

        //-------------------------------DELETE BIKE-------------------------------
        public class DeleteBikeRequest
        {
            public int BikeID { get; set; }
        }

        [HttpPost("delete-bike")]
        public async Task<IActionResult> DeleteBike(DeleteBikeRequest request)
        {
            var bike = await _db.SavedBikes.FirstOrDefaultAsync(b => b.Id == request.BikeID);

            if (bike == null)
            {
                return NotFound("Bike not found");
            }

            _db.SavedBikes.Remove(bike);
            await _db.SaveChangesAsync();

            return Ok("Bike deleted");
        }
    }
}
