namespace FamilyRecipes.Api.Exceptions;

public class IdempotencyKeyReusedException(Guid idempotencyKey)
    : Exception($"Idempotency key {idempotencyKey} was already used with a different request.")
{
    public Guid IdempotencyKey { get; } = idempotencyKey;
}
