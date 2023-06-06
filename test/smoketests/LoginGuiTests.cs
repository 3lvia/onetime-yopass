#pragma warning disable S2699 // Tests should include assertions
using Microsoft.Playwright;
using Xunit;

namespace smoketests;

[Collection(SmoketestCollection.CollectionName)]
public class LoginGuiTests : IClassFixture<BrowserFixture>
{
    private readonly TestCollectionFixture _testFixture;
    private readonly BrowserFixture _browserFixture;
    private readonly string _onetimeBaseUrl;
    private readonly string _elvidBaseUrl;

    // These tests require playwright to be installed
    // Playwright install guide: Build this project, then run ./tests/ElvID.SmokeTests/bin/Debug/net6.0/playwright.ps1 install
    public LoginGuiTests(BrowserFixture browserFixture, TestCollectionFixture testFixture)
    {
        _testFixture = testFixture;
        _browserFixture = browserFixture;
        _onetimeBaseUrl = _testFixture.OnetimeIoBaseAddress;
        _elvidBaseUrl = _testFixture.ElvidBaseAddress;
    }

    [Theory]
    [InlineData(Browser.Firefox)]
    [InlineData(Browser.Chromium)]
    [InlineData(Browser.Webkit)]
    public async Task LocalLogin_UsingWrongPassword_ReturnsLoginError(Browser browser)
    {
        var page = await OpenBrowserPage(browser);

        await page.GotoAsync($"{_onetimeBaseUrl}");
        await page.WaitForURLAsync($"{_elvidBaseUrl}/Account/Login**",
            new PageWaitForURLOptions { Timeout = 3000 });
        await page.GetByRole(AriaRole.Button, new() { Name = "Logg inn med e-post" }).ClickAsync();
        await page.GetByPlaceholder("Skriv inn e-post").FillAsync(_testFixture.LocalTestUserUsername);
        await page.GetByPlaceholder("Skriv inn passord").FillAsync("some_wrong_password");

        await page.GetByRole(AriaRole.Button, new() { Name = "Logg inn med e-post" }).ClickAsync();
        await page.WaitForURLAsync($"{_elvidBaseUrl}/Account/Login**",
            new PageWaitForURLOptions { Timeout = 3000 });
        await page.GetByText("Feil e-post eller passord").WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });

    }

    [Theory]
    [InlineData(Browser.Firefox)]
    [InlineData(Browser.Chromium)]
    [InlineData(Browser.Webkit)]
    public async Task LocalLogin_UsingValidUserCredentials_UserIsLoggedIn(Browser browser)
    {
        var page = await OpenBrowserPage(browser);

        await page.GotoAsync($"{_onetimeBaseUrl}");
        await page.WaitForURLAsync($"{_elvidBaseUrl}/Account/Login**",
            new PageWaitForURLOptions { Timeout = 3000 });
        await page.GetByRole(AriaRole.Button, new() { Name = "Logg inn med e-post" }).ClickAsync();
        await page.GetByPlaceholder("Skriv inn e-post").FillAsync(_testFixture.LocalTestUserUsername);
        await page.GetByPlaceholder("Skriv inn passord").FillAsync(_testFixture.LocalTestUserPassword);
        await page.GetByRole(AriaRole.Button, new() { Name = "Logg inn med e-post" }).ClickAsync();

        await page.WaitForURLAsync($"{_onetimeBaseUrl}/**",
            new PageWaitForURLOptions { Timeout = 3000 });
        await page
            .GetByRole(AriaRole.Heading, new() { Name = "Encrypt message" })
            .WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible, Timeout = 3000});
    }

    private async Task<IPage> OpenBrowserPage(Browser browser)
    {
        IBrowserContext context;
        if (browser == Browser.Firefox)
        {
            context = await _browserFixture.FirefoxBrowser.NewContextAsync();
        }
        else if (browser == Browser.Chromium)
        {
            context = await _browserFixture.ChromiumBrowser.NewContextAsync();
        }
        else if (browser == Browser.Webkit)
        {
            context = await _browserFixture.WebkitBrowser.NewContextAsync();
        }
        else
        {
            throw new ArgumentException("Unknown browser");
        }
        return await context.NewPageAsync();
    }
}

// ReSharper disable once ClassNeverInstantiated.Global
#pragma warning restore S2699 // Tests should include assertions