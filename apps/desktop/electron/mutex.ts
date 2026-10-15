import koffi from 'koffi';

const ERROR_ALREADY_EXISTS = 183;
const MUTEX_NAME = 'Local\\Data7Expedicao';

type CreateMutex = (attributes: null, initialOwner: boolean, name: string) => unknown;
type CloseHandle = (handle: unknown) => boolean;
type GetLastError = () => number;

let mutexHandle: unknown = null;
let createMutex: CreateMutex | null = null;
let closeHandle: CloseHandle | null = null;
let getLastError: GetLastError | null = null;

function bindKernel(): void {
  if (createMutex) {
    return;
  }
  const kernel = koffi.load('kernel32.dll');
  createMutex = kernel.func(
    'void* __stdcall CreateMutexW(void *lpMutexAttributes, bool bInitialOwner, str16 lpName)',
  ) as CreateMutex;
  closeHandle = kernel.func('bool __stdcall CloseHandle(void *hObject)') as CloseHandle;
  getLastError = kernel.func('uint32 __stdcall GetLastError()') as GetLastError;
}

/** O lock do Electron não é um mutex do Windows. O Inno enxerga este nome. */
export function acquireAppMutex(): boolean {
  bindKernel();
  if (!createMutex || !closeHandle || !getLastError) {
    return false;
  }

  const created = createMutex(null, false, MUTEX_NAME);
  const code = getLastError();
  if (!created || code === ERROR_ALREADY_EXISTS) {
    if (created) {
      closeHandle(created);
    }
    return false;
  }

  mutexHandle = created;
  return true;
}

export function releaseAppMutex(): void {
  if (!mutexHandle || !closeHandle) {
    return;
  }
  closeHandle(mutexHandle);
  mutexHandle = null;
}
