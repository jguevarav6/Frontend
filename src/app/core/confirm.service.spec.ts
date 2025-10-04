import { ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  let svc: ConfirmService;
  beforeEach(() => svc = new ConfirmService());

  it('should resolve true when app-confirm-result true is dispatched', async () => {
    const p = svc.confirmAsync({ message: 'ok' });
    // simulate the user confirming
    window.dispatchEvent(new CustomEvent('app-confirm-result', { detail: { confirmed: true } }));
    const res = await p;
    expect(res).toBeTrue();
  });
});
