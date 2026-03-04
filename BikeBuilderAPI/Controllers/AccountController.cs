/*
    AccountController.cs

    This controller handles account-related actions that occur during logout
    and session management. It exposes three endpoints: one to clear the
    user session JSON file, one to clear the user's saved bikes JSON file,
    and one to refresh the user's saved bikes JSON file from the database
    using the currently stored session ID. These are called by index-script.js
    when the user logs out or navigates to the View Account page.
*/

using BikeBuilderAPI.Model;
using BikeBuilderAPI.Models;
using BikeBuilderAPI.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BikeBuilderAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        // Clears the user_session.json file, effectively logging the user out on the front end
        [HttpPost("/api/logout/clear-session")]
        public IActionResult ClearSession()
        {
            ClearUserSession.Clear();
            return Ok();
        }

        // Clears the user_saves.json file so saved bikes are not visible after logout
        [HttpPost("/api/logout/clear-saves")]
        public IActionResult ClearSaves()
        {
            ClearUserSaves.Clear();
            return Ok();
        }

        // Re-exports the logged-in user's saved bikes to user_saves.json from the database
        // Called before navigating to the View Account page to ensure the data is up to date
        [HttpPost("/api/logout/refresh-user-saves")]
        public IActionResult RefreshUserSaves()
        {
            // Read the current session file to retrieve the logged-in user's account ID
            var SessionFile = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "user_session.json");

            var json = System.IO.File.ReadAllText(SessionFile);
            var session = System.Text.Json.JsonSerializer.Deserialize<SessionUser>(json);

            // Export all saved bikes for this account ID to user_saves.json
            using (var db = new AccountsContext())
            {
                UserSaveExporter.ExportUserSavesToJson(session.AccountId, db);
            }
            return Ok();
        }
    }
}