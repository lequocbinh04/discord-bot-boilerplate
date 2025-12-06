export abstract class BaseEntity<TId> {
  constructor(
    public readonly id: TId,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  protected touch(): void {
    this.updatedAt = new Date();
  }
}
