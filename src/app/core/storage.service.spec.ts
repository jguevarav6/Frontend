import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getItem', () => {
    it('should return default value when key does not exist', () => {
      const result = service.getItem('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should return null as default when not provided', () => {
      const result = service.getItem('nonexistent');
      expect(result).toBeNull();
    });

    it('should parse and return stored value', () => {
      const data = { name: 'Test', value: 123 };
      localStorage.setItem('test-key', JSON.stringify(data));

      const result = service.getItem<typeof data>('test-key', null);
      expect(result).toEqual(data);
    });

    it('should return default value on parse error', () => {
      localStorage.setItem('invalid', 'invalid json {[}');

      const result = service.getItem('invalid', 'fallback');
      expect(result).toBe('fallback');
    });

    it('should handle arrays correctly', () => {
      const array = [1, 2, 3, 4, 5];
      localStorage.setItem('array-key', JSON.stringify(array));

      const result = service.getItem<number[]>('array-key', []);
      expect(result).toEqual(array);
    });

    it('should handle boolean values', () => {
      localStorage.setItem('bool-key', JSON.stringify(true));

      const result = service.getItem<boolean>('bool-key', false);
      expect(result).toBe(true);
    });
  });

  describe('setItem', () => {
    it('should store value as JSON string', () => {
      const data = { test: 'value', number: 42 };
      service.setItem('test-key', data);

      const stored = localStorage.getItem('test-key');
      expect(stored).toBe(JSON.stringify(data));
    });

    it('should handle arrays', () => {
      const array = ['a', 'b', 'c'];
      service.setItem('array', array);

      const stored = JSON.parse(localStorage.getItem('array')!);
      expect(stored).toEqual(array);
    });

    it('should handle primitive values', () => {
      service.setItem('string', 'hello');
      service.setItem('number', 123);
      service.setItem('boolean', true);

      expect(localStorage.getItem('string')).toBe('"hello"');
      expect(localStorage.getItem('number')).toBe('123');
      expect(localStorage.getItem('boolean')).toBe('true');
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      
      // Simular error de espacio en localStorage
      spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');

      service.setItem('test', 'value');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('to-remove', 'value');
      expect(localStorage.getItem('to-remove')).not.toBeNull();

      service.removeItem('to-remove');
      expect(localStorage.getItem('to-remove')).toBeNull();
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => service.removeItem('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all localStorage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      service.clear();

      expect(localStorage.length).toBe(0);
    });
  });

  describe('hasItem', () => {
    it('should return true when key exists', () => {
      localStorage.setItem('existing', 'value');
      expect(service.hasItem('existing')).toBe(true);
    });

    it('should return false when key does not exist', () => {
      expect(service.hasItem('nonexistent')).toBe(false);
    });

    it('should return true even if value is empty string', () => {
      localStorage.setItem('empty', '');
      expect(service.hasItem('empty')).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete CRUD cycle', () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const user: User = { id: 1, name: 'John', email: 'john@test.com' };

      // Create
      service.setItem('user', user);
      expect(service.hasItem('user')).toBe(true);

      // Read
      const retrieved = service.getItem<User>('user', null);
      expect(retrieved).toEqual(user);

      // Update
      const updated = { ...user, name: 'Jane' };
      service.setItem('user', updated);
      const retrievedUpdated = service.getItem<User>('user', null);
      expect(retrievedUpdated?.name).toBe('Jane');

      // Delete
      service.removeItem('user');
      expect(service.hasItem('user')).toBe(false);
    });

    it('should handle multiple items independently', () => {
      service.setItem('item1', { value: 1 });
      service.setItem('item2', { value: 2 });
      service.setItem('item3', { value: 3 });

      expect(service.getItem<any>('item1', null)?.value).toBe(1);
      expect(service.getItem<any>('item2', null)?.value).toBe(2);
      expect(service.getItem<any>('item3', null)?.value).toBe(3);

      service.removeItem('item2');

      expect(service.hasItem('item1')).toBe(true);
      expect(service.hasItem('item2')).toBe(false);
      expect(service.hasItem('item3')).toBe(true);
    });
  });
});
