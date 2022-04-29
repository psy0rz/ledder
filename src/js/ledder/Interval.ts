
export class Interval
{

  resolve: (value: boolean) => void

  check?(time: number): boolean

  promise()
  {
    return(new Promise((resolve, reject)=>{
      this.resolve=resolve
    }))
  }

}
