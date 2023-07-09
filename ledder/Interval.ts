
export default class Interval
{

  //TODO: use PublicPromise instead
  resolve: (value: boolean) => void
  reject: (reason?: any) => void
  promise: Promise<any>

  check?(time: number): boolean

  createPromise()
  {
    this.promise=new Promise((resolve, reject)=>{
      this.resolve=resolve
      this.reject=reject
    })

    // this.promise.catch( (e)=> console.log("SJA") )

    return(this.promise)
  }

  // //Rejects existing interval promise but prevents any uncathed errors.
  // //This way we make sure that intervals inside while-loops raise exceptions and thus breaking the loop
  // abort()
  // {
  //   this.promise.catch( (e)=>{
  //     if (e!='abort')
  //       console.error("Interval: Promise was rejected: " , e)
  //   })
  //
  //   this.reject("abort")
  // }


}
