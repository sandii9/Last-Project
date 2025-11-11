export function withViewTransition(fn){
  return (...args)=>{
    if (document.startViewTransition){
      return document.startViewTransition(()=> fn(...args));
    }
    return fn(...args);
  };
}