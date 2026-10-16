using FamilyRecipes.Api.Authentication;
using FamilyRecipes.Api.Models;
using FamilyRecipes.Api.Repositories;
using FamilyRecipes.Api.Services;
using NSubstitute;

namespace FamilyRecipes.Api.UnitTests.Services;

public sealed class UserServiceTests
{
    private const string TenantId = "tenant-1";
    private const string ObjectId = "user-a";

    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly ICurrentUserContext _currentUserContext = Substitute.For<ICurrentUserContext>();
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _currentUserContext.GetRequiredTenantId().Returns(TenantId);
        _currentUserContext.GetRequiredObjectId().Returns(ObjectId);
        _sut = new UserService(_userRepository, _currentUserContext);
    }

    [Fact]
    public async Task GetOrCreateCurrentAsync_WhenUserExists_ReturnsExistingWithoutSaving()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var existingUser = new User
        {
            Id = 1,
            ExternalTenantId = TenantId,
            ExternalUserId = ObjectId,
            Name = "Anna",
        };
        _userRepository
            .GetByExternalIdentityAsync(TenantId, ObjectId, cancellationToken)
            .Returns(existingUser);

        var result = await _sut.GetOrCreateCurrentAsync(cancellationToken);

        Assert.Same(existingUser, result);
        await _userRepository.DidNotReceive().AddAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
        await _userRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetOrCreateCurrentAsync_WhenDisplayNameIsMissing_UsesDefaultName(string? displayName)
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        _userRepository
            .GetByExternalIdentityAsync(TenantId, ObjectId, cancellationToken)
            .Returns((User?)null);
        _currentUserContext.GetDisplayName().Returns(displayName);

        var result = await _sut.GetOrCreateCurrentAsync(cancellationToken);

        Assert.Equal("New user", result.Name);
        await _userRepository.Received(1).AddAsync(
            Arg.Is<User>(user =>
                user.ExternalTenantId == TenantId &&
                user.ExternalUserId == ObjectId &&
                user.Name == "New user"),
            cancellationToken);
        await _userRepository.Received(1).SaveChangesAsync(cancellationToken);
    }
}
