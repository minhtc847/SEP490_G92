using System.Diagnostics;

public static class DriverHelper
{
    public static void KillChromeDriver()
    {
        try
        {
            foreach (var process in Process.GetProcessesByName("chromedriver"))
            {
                process.Kill();
            }
            foreach (var process in Process.GetProcessesByName("chrome"))
            {
                process.Kill();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error killing Chrome/ChromeDriver: " + ex.Message);
        }
    }
}
