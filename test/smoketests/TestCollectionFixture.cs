using Elvia.Configuration.HashiVault;
using Xunit;

namespace smoketests;

[CollectionDefinition(CollectionName)]
public class SmoketestCollection : ICollectionFixture<TestCollectionFixture>
{
    public const string CollectionName = "Smoketest";
}

// ReSharper disable once ClassNeverInstantiated.Global
public class TestCollectionFixture
{
    public string OnetimeIoBaseAddress { get; }
    public string ElvidBaseAddress { get; private set; }
    public readonly string LocalTestUserPassword = HashiVault.EnsureHasValue("onetime/kv/manual/onetime-internal-testuser/password");
    public readonly string LocalTestUserUsername = HashiVault.EnsureHasValue("onetime/kv/manual/onetime-internal-testuser/email");
    
    private readonly string _atlasEnvironment = HashiVault.EnsureHasValue("shared/kv/info/environment");

    public TestCollectionFixture()
    {
        OnetimeIoBaseAddress = $"https://onetime.{(_atlasEnvironment == "prod" ? "" : _atlasEnvironment + "-")}elvia.io";
        ElvidBaseAddress = _atlasEnvironment == "prod" ? "https://elvid.elvia.io" : "https://elvid.test-elvia.io";
    }
}