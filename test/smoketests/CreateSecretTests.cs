using System.Text.RegularExpressions;
using Microsoft.Playwright;
using Xunit;
using Xunit.Sdk;

namespace smoketests;

[Collection(SmoketestCollection.CollectionName)]
public class CreateSecretTests : IClassFixture<BrowserFixture>
{
    private readonly TestCollectionFixture _testFixture;
    private readonly BrowserFixture _browserFixture;
    private readonly string _onetimeBaseUrl;
    private readonly string _elvidBaseUrl;

    // These tests require playwright to be installed
    // Playwright install guide: Build this project, then run ./tests/smoketests/bin/Debug/net7.0/playwright.ps1 install
    public CreateSecretTests(BrowserFixture browserFixture, TestCollectionFixture testFixture)
    {
        _testFixture = testFixture;
        _browserFixture = browserFixture;
        _onetimeBaseUrl = _testFixture.OnetimeIoBaseAddress;
        _elvidBaseUrl = _testFixture.ElvidBaseAddress;
    }

    // [Theory]
    // [InlineData(Browser.Firefox)] 
    // [InlineData(Browser.Chromium)] // does not work, although it works in debug mode
    // [InlineData(Browser.Webkit)] // works some times only
    public async Task CreateSecret(Browser browser)
    {
        var page = await OpenBrowserPage(browser);
        await Login(page);
        await page
            .GetByRole(AriaRole.Textbox, new() { Name = "Secret message" })
            .FillAsync("my plaintext");
        await page.GetByRole(AriaRole.Button, new() { Name = "ENCRYPT MESSAGE" }).ClickAsync();
        await page
            .GetByRole(AriaRole.Heading, new() { Name = "Secret stored in database" })
            .WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible});

        var link = await page
            .GetByRole(AriaRole.Cell,
                new PageGetByRoleOptions
                    { NameRegex = new Regex("https:\\/\\/.*\\/#\\/s\\/\\w+-\\w+-\\w+-\\w+-\\w+\\/\\w+") })
            .TextContentAsync();
        Assert.NotEmpty(link ?? "");
        
        await page.GotoAsync(link ?? "");
        await page
            .GetByRole(AriaRole.Heading, new() { Name = "Decrypted Message" })
            .WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible});
    }

    private async Task Login(IPage page)
    {
        await page.GotoAsync($"{_onetimeBaseUrl}");
        await page.WaitForURLAsync($"{_elvidBaseUrl}/Account/Login**");
        await page.GetByRole(AriaRole.Button, new() { Name = "Logg inn med e-post" }).ClickAsync();
        await page.GetByPlaceholder("Skriv inn e-post").FillAsync(_testFixture.LocalTestUserUsername);
        await page.GetByPlaceholder("Skriv inn passord").FillAsync(_testFixture.LocalTestUserPassword);
        await page.GetByRole(AriaRole.Button, new() { Name = "Logg inn med e-post" }).ClickAsync();

        await page.WaitForURLAsync($"{_onetimeBaseUrl}/**");
        await page
            .GetByRole(AriaRole.Heading, new() { Name = "Encrypt message" })
            .WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible});
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
