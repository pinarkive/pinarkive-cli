declare module 'degit' {
  interface DegitEmitter {
    clone(dest: string): Promise<void>;
  }
  function degit(repo: string, options?: { cache?: boolean; force?: boolean }): DegitEmitter;
  export default degit;
}
