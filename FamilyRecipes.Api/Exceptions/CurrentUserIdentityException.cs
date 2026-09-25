namespace FamilyRecipes.Api.Exceptions;

public sealed class CurrentUserIdentityException(string message) : Exception(message);
