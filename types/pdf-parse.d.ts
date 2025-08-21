declare module "pdf-parse" {
  const pdf: (dataBuffer: Buffer) => Promise<{ text: string }>;
  export default pdf;
}
