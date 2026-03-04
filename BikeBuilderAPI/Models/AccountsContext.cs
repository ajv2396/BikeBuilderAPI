/*
    AccountsContext.cs

    This class is the Entity Framework Core database context for the Bike Builder
    system. It defines the five database tables used by the application as DbSet
    properties, and configures the connection to the SQLite database file.
    It also overrides OnModelCreating to explicitly set the primary key for the
    Review entity, which was required because EF Core could not infer it automatically.
*/

using BikeBuilderAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BikeBuilderAPI.Model
{
    public class AccountsContext : DbContext
    {
        // Each DbSet corresponds to a table in the SQLite database
        public DbSet<Account> Accounts { get; set; }
        public DbSet<SavedBike> SavedBikes { get; set; }
        public DbSet<BikeParts> BikeParts { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Order> Orders { get; set; }

        // Configures the database provider and connection string pointing to the SQLite file
        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite(@"Data Source = MTB-Builder.db");

        // Explicitly configures the primary key for the Review entity
        // This override was added because EF Core was not correctly identifying ReviewId as the key
        //configure primary key for reviews as not working previously
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Review>()
                .HasKey(r => r.ReviewId);

            base.OnModelCreating(modelBuilder);
        }
    }
}