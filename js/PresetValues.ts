/** Actual preset-values
 * (jsonable)
 */
export class PresetValues {
    values: Record<string, Record<string, any>>
    title: string;
    description: string;

    constructor() {
      this.values={};
      this.title="Untitled";
      this.description="";
    }
}
