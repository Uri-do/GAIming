﻿using System;

class Program
{
    static void Main()
    {
        string password = "Admin123!";
        string hash = BCrypt.Net.BCrypt.HashPassword(password, 12);
        Console.WriteLine($"Password: {password}");
        Console.WriteLine($"BCrypt Hash: {hash}");

        // Test verification
        bool isValid = BCrypt.Net.BCrypt.Verify(password, hash);
        Console.WriteLine($"Verification: {isValid}");
    }
}
