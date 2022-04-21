
export abstract class Interval
{
  resolve: (value:unknown)=> void;

  abstract check(time);

}
