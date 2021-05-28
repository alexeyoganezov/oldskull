import {
  OsfObservable,
  IOsfModel,
  IOsfObservable,
  MODEL_ADDED_EVENT,
  MODEL_REMOVED_EVENT,
  COLLECTION_RESETED_EVENT,
} from './internal';

export interface IOsfCollection<M> extends IOsfObservable {
  models: M[];
  add(model: M): void
  get(modelId: any): M | undefined
  remove(modelId: any): void
  set(models: M[]): void
}

/**
 * Wraps and manages a list of Models.
 */
export class OsfCollection<
    M extends IOsfModel<object>,
  > extends OsfObservable implements IOsfCollection<M> {
  /**
   * A list of Models managed by the Collection
   */
  public models: M[];

  /**
   * @param models - Models to wrap and manage
   */
  constructor(models: M[] = []) {
    super();
    this.models = models;
  }

  /**
   * Add a model or an array models to the collection.
   *
   * @param model - Model or Models to add
   */
  public add(model: M | M[]): void {
    if (Array.isArray(model)) {
      this.models.push(...model);
    } else {
      this.models.push(model);
    }
    this.trigger(MODEL_ADDED_EVENT, model);
  }

  /**
   * Get a Model with specified id from the Collection.
   *
   * @param modelId - id of the model to get
   * @returns found model
   */
  public get(modelId: any): M | undefined {
    return this.models.find((model) => model.getId() === modelId);
  }

  /**
   * Remove a Model with specified id from the Collection.
   *
   * @param modelId - id of the model to remove
   */
  public remove(modelId: any): void {
    const model = this.get(modelId);
    if (model) {
      this.models = this.models.filter((m) => m.getId() !== modelId);
      this.trigger(MODEL_REMOVED_EVENT, model);
    }
  }

  /**
   * Replace models in the collection with provided ones.
   *
   * @param models - models to set
   * @param hardReset - skip merge with already presented models in the collection
   */
  public set(models: M[], hardReset: boolean = false): void {
    if (hardReset) {
      this.models = models;
      this.trigger(COLLECTION_RESETED_EVENT);
      return;
    }
    const processedModels: M[] = [];
    models.forEach((model) => {
      const existingModel = this.get(model.getId());
      if (existingModel) {
        existingModel.set(model);
      } else {
        this.add(model);
      }
      processedModels.push(model);
    });
    // Remove not presented models
    this.models.forEach((model) => {
      if (!processedModels.includes(model)) {
        this.remove(model.getId());
      }
    });
  }
}
