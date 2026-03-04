/*
    SessionUser.cs

    This class represents the session data that is written to user_session.json
    when a user successfully logs in or registers. It stores only the non-sensitive
    fields needed by the front end (account ID, name, and email). The password hash
    is deliberately excluded from this model so it is never exposed to the client.
    This file is read by the front end to determine whether a user is logged in
    and to display their name and account ID in the navigation bar.
*/

using BikeBuilderAPI.Model;
using System.Text.Json;

public class SessionUser
{
    public int AccountId { get; set; }      // Unique identifier for the logged-in user's account
    public string FirstName { get; set; }   // Used to display the user's name in the nav bar
    public string LastName { get; set; }    // Used alongside FirstName for display and review attribution
    public string Email { get; set; }       // Stored in session for display on the View Account page
}