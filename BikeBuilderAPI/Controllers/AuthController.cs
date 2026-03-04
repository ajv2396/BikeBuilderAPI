/*
    AuthController.cs

    This controller handles user authentication for the Bike Builder system.
    It exposes two endpoints: one for logging in and one for registering a
    new account. Passwords are never stored or compared in plain text — they
    are hashed using SHA-256 before storage and before comparison at login.
    On successful login or sign up, the user's session is written to
    user_session.json so the front end can read it to determine login state.
*/

using BikeBuilderAPI.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;

namespace BikeBuilderAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        //--------------------------------LOGIN--------------------------------

        // Request model for the login endpoint
        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        // Validates login credentials against the database and creates a session on success
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            using (var db = new AccountsContext())
            {
                // Look up the account by email address
                var account = db.Accounts.FirstOrDefault(a => a.Email == request.Email);

                //if the email isnt found on database
                if (account == null)
                {
                    return Unauthorized(new { sucess = false, message = "Invalid credentials" });
                }

                // Hash the submitted password using SHA-256 to compare against the stored hash
                string LoginHashedPassword = HashPassword(request.Password);

                //if the email is found then check if the password mathces it
                if (LoginHashedPassword == account.Password)
                {
                    // Write the logged-in user's details to the session file
                    SaveUserSession(account);
                    // Export this user's saved bikes and orders to JSON for the front end
                    UserSaveExporter.ExportUserSavesToJson(account.AccountId, db);
                    UserOrderExporter.ExportOrdersToJson(account.AccountId, db);
                    return Ok(new { sucess = true, message = "Login sucessful" });
                }
                else
                {
                    return Unauthorized(new { success = false, message = "Invalid credentials" });
                }
            }
        }

        //-------------------------------SIGN UP-------------------------------

        // Request model for the sign up endpoint
        public class SignUpRequest
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
        }

        // Registers a new user account, hashes their password, and creates a session
        [HttpPost("signup")]
        public IActionResult SignUp([FromBody] SignUpRequest request)
        {
            using (var db = new AccountsContext())
            {
                //for checking if email already exists in the database
                var EmailCheck = db.Accounts.FirstOrDefault(a => a.Email == request.Email);

                // Return 409 Conflict if the email is already registered
                // "res.status === 409" in login.html handles this to stop users creating multiple accounts
                if (EmailCheck != null)
                {
                    return Conflict(new { success = false, message = "Email already registered" });
                }

                // Hash the password before storing it — plain text passwords are never saved
                string HashedPassword = HashPassword(request.Password);

                // Create the new account record with the hashed password
                var account = new Account
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    Password = HashedPassword
                };

                db.Add(account);
                db.SaveChanges();

                // Write the new user's session to file so they are immediately logged in
                SaveUserSession(account);
            }
            return Ok("User signed up");
        }

        //-------------------------------SAVE USER SESSION-------------------------------

        // Serialises the account's non-sensitive details to user_session.json
        // This file is read by the front end to determine whether a user is logged in
        public void SaveUserSession(Account account)
        {
            // Only store non-sensitive fields — password hash is never written to the session file
            var sessionUser = new SessionUser
            {
                AccountId = account.AccountId,
                FirstName = account.FirstName,
                LastName = account.LastName,
                Email = account.Email
            };

            string json = JsonSerializer.Serialize(sessionUser);
            string FilePath = "wwwroot/user_session.json";

            // Overwrite the session file with the new session data
            using (FileStream FileStream = new FileStream(FilePath, FileMode.Create))
            using (StreamWriter StreamWriter = new StreamWriter(FileStream))
            {
                StreamWriter.Write(json);
            }
        }

        //-------------------------------SHA256 ENCRYPTION-------------------------------

        // Hashes a plain text password using SHA-256 and returns it as a lowercase hex string
        // Used both when storing a new password and when comparing a login attempt
        public static string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                // Convert the password string to a UTF-8 byte array
                byte[] bytes = Encoding.UTF8.GetBytes(password);
                // Apply the SHA-256 hashing algorithm
                byte[] hashBytes = sha256.ComputeHash(bytes);
                // Convert the resulting bytes to a lowercase hexadecimal string
                StringBuilder builder = new StringBuilder();
                foreach (byte b in hashBytes)
                {
                    builder.Append(b.ToString("x2"));
                }

                return builder.ToString();
            }
        }
    }
}