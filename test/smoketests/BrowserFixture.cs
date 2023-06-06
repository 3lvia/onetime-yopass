using Microsoft.Playwright;

namespace smoketests;

public enum Browser { Chromium, Firefox, Webkit }

public class BrowserFixture : IAsyncDisposable
{
    public IBrowser ChromiumBrowser { get; }
    public IBrowser FirefoxBrowser { get; }
    public IBrowser WebkitBrowser { get; }
    private readonly IPlaywright? _playwright;

    public BrowserFixture()
    {
        _playwright = Playwright.CreateAsync().GetAwaiter().GetResult();
        var runInHeadlesMode = !System.Diagnostics.Debugger.IsAttached; // Only show the browser during debugging tests
        ChromiumBrowser = _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = runInHeadlesMode
        }).GetAwaiter().GetResult();
        FirefoxBrowser = _playwright.Firefox.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = runInHeadlesMode
        }).GetAwaiter().GetResult();
        WebkitBrowser = _playwright.Webkit.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = runInHeadlesMode,
        }).GetAwaiter().GetResult();
    }

    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore().ConfigureAwait(false);

        GC.SuppressFinalize(this);
    }

    protected virtual async ValueTask DisposeAsyncCore()
    {
        await ChromiumBrowser.DisposeAsync();
        await FirefoxBrowser.DisposeAsync();
        await WebkitBrowser.DisposeAsync();

        _playwright?.Dispose();
    }
}