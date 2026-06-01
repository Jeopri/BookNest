declare module 'formidable' {
  export interface File {
    size: number;
    filepath: string;
    newFilename: string;
    mimetype: string;
    mtime?: string;
  }

  export interface Fields {
    [key: string]: string | string[];
  }

  export class IncomingForm {
    parse(req: any, callback: (err: any, fields: Fields, files: { [key: string]: File[] }) => void): void;
  }

  export function IncomingForm(): IncomingForm;
}