import { ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  let service: ConfirmService;

  beforeEach(() => {
    service = new ConfirmService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve true when user confirms', async () => {
    const promise = service.confirmAsync({ message: 'Are you sure?' });
    
    // Simulate user clicking confirm button (this is what the component does)
    setTimeout(() => {
      service.emitResult(true);
    }, 10);
    
    const result = await promise;
    expect(result).toBe(true);
  });

  it('should resolve false when user cancels', async () => {
    const promise = service.confirmAsync({ message: 'Are you sure?' });
    
    // Simulate user clicking cancel button
    setTimeout(() => {
      service.emitResult(false);
    }, 10);
    
    const result = await promise;
    expect(result).toBe(false);
  });

  it('should emit request when confirmAsync is called', (done) => {
    service.onRequest().subscribe(request => {
      expect(request.opts).toBeTruthy();
      expect(request.opts?.message).toBe('Test message');
      done();
    });

    service.confirmAsync({ message: 'Test message' });
  });

  it('should clear modal when clear is called', (done) => {
    service.onRequest().subscribe(request => {
      if (request.opts === null) {
        expect(request.opts).toBeNull();
        done();
      }
    });

    service.clear();
  });

  it('should handle custom confirm options', async () => {
    const options = {
      title: 'Custom Title',
      message: 'Custom message',
      confirmText: 'Yes',
      cancelText: 'No'
    };

    const promise = service.confirmAsync(options);
    
    setTimeout(() => {
      service.emitResult(true);
    }, 10);
    
    const result = await promise;
    expect(result).toBe(true);
  });
});
