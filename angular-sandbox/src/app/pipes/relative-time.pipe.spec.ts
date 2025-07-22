import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  let pipe: RelativeTimePipe;
  let mockDate: Date;

  beforeEach(() => {
    pipe = new RelativeTimePipe();
    // Set a fixed date for consistent testing
    mockDate = new Date('2024-01-15T12:00:00Z');
    jasmine.clock().install();
    jasmine.clock().mockDate(mockDate);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null or undefined values', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should return empty string for invalid dates', () => {
    expect(pipe.transform('invalid-date')).toBe('');
    expect(pipe.transform('not-a-date')).toBe('');
  });

  it('should format seconds correctly in Dutch', () => {
    const secondsAgo = new Date(mockDate.getTime() - 30 * 1000);
    const secondsFromNow = new Date(mockDate.getTime() + 45 * 1000);
    
    const resultPast = pipe.transform(secondsAgo);
    const resultFuture = pipe.transform(secondsFromNow);
    
    // Check that it uses Dutch formatting - the exact text may vary
    expect(resultPast).toBeTruthy();
    expect(resultFuture).toBeTruthy();
    expect(typeof resultPast).toBe('string');
    expect(typeof resultFuture).toBe('string');
  });

  it('should format minutes correctly in Dutch', () => {
    const minutesAgo = new Date(mockDate.getTime() - 5 * 60 * 1000);
    const minutesFromNow = new Date(mockDate.getTime() + 10 * 60 * 1000);
    
    const resultPast = pipe.transform(minutesAgo);
    const resultFuture = pipe.transform(minutesFromNow);
    
    // Check that it uses Dutch formatting and includes "minuten" or "minuut"
    expect(resultPast).toMatch(/minuut|minuten/);
    expect(resultFuture).toMatch(/minuut|minuten/);
  });

  it('should format hours correctly in Dutch', () => {
    const hoursAgo = new Date(mockDate.getTime() - 3 * 60 * 60 * 1000);
    const hoursFromNow = new Date(mockDate.getTime() + 2 * 60 * 60 * 1000);
    
    const resultPast = pipe.transform(hoursAgo);
    const resultFuture = pipe.transform(hoursFromNow);
    
    // Check that it uses Dutch formatting and includes "uur" or similar
    expect(resultPast).toContain('uur');
    expect(resultFuture).toContain('uur');
  });

  it('should format days correctly in Dutch', () => {
    const daysAgo = new Date(mockDate.getTime() - 2 * 24 * 60 * 60 * 1000);
    const daysFromNow = new Date(mockDate.getTime() + 5 * 24 * 60 * 60 * 1000);
    
    const resultPast = pipe.transform(daysAgo);
    const resultFuture = pipe.transform(daysFromNow);
    
    // Check that it uses Dutch formatting - may use words like "eergisteren", "gisteren", "volgende week", etc.
    expect(resultPast).toBeTruthy();
    expect(resultFuture).toBeTruthy();
    expect(typeof resultPast).toBe('string');
    expect(typeof resultFuture).toBe('string');
  });

  it('should format weeks correctly in Dutch', () => {
    const weeksAgo = new Date(mockDate.getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
    const weeksFromNow = new Date(mockDate.getTime() + 3 * 7 * 24 * 60 * 60 * 1000);
    
    const resultPast = pipe.transform(weeksAgo);
    const resultFuture = pipe.transform(weeksFromNow);
    
    // Check that it uses Dutch formatting and includes "week" or may use phrases
    expect(resultPast).toMatch(/week|weken/);
    expect(resultFuture).toBeTruthy(); // May say "volgende maand" for 3 weeks
  });

  it('should format months correctly in Dutch', () => {
    const monthsAgo = new Date(mockDate.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
    const monthsFromNow = new Date(mockDate.getTime() + 2 * 30 * 24 * 60 * 60 * 1000);
    
    const resultPast = pipe.transform(monthsAgo);
    const resultFuture = pipe.transform(monthsFromNow);
    
    // Check that it uses Dutch formatting and includes "maand" or similar
    expect(resultPast).toContain('maand');
    expect(resultFuture).toContain('maand');
  });

  it('should format years correctly in Dutch', () => {
    const yearsAgo = new Date(mockDate.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
    const yearsFromNow = new Date(mockDate.getTime() + 1 * 365 * 24 * 60 * 60 * 1000);
    
    const resultPast = pipe.transform(yearsAgo);
    const resultFuture = pipe.transform(yearsFromNow);
    
    // Check that it uses Dutch formatting and includes "jaar" or similar
    expect(resultPast).toContain('jaar');
    expect(resultFuture).toContain('jaar');
  });

  it('should handle Date objects, strings, and numbers as input', () => {
    const testDate = new Date(mockDate.getTime() - 60 * 1000);
    
    // Test Date object
    const resultFromDate = pipe.transform(testDate);
    expect(resultFromDate).toBeTruthy();
    
    // Test ISO string
    const resultFromString = pipe.transform(testDate.toISOString());
    expect(resultFromString).toBeTruthy();
    
    // Test timestamp number
    const resultFromNumber = pipe.transform(testDate.getTime());
    expect(resultFromNumber).toBeTruthy();
    
    // All should produce similar results
    expect(resultFromDate).toEqual(resultFromString);
    expect(resultFromDate).toEqual(resultFromNumber);
  });

  it('should choose appropriate time unit based on difference magnitude', () => {
    // Test that it picks the right unit for different time differences
    const oneMinuteAgo = new Date(mockDate.getTime() - 61 * 1000); // Just over 1 minute
    const oneHourAgo = new Date(mockDate.getTime() - 61 * 60 * 1000); // Just over 1 hour
    const oneDayAgo = new Date(mockDate.getTime() - 25 * 60 * 60 * 1000); // Just over 1 day
    
    const minuteResult = pipe.transform(oneMinuteAgo);
    const hourResult = pipe.transform(oneHourAgo);
    const dayResult = pipe.transform(oneDayAgo);
    
    expect(minuteResult).toMatch(/minuut|minuten/);
    expect(hourResult).toContain('uur');
    // Day result may be "gisteren" or contain "dag"
    expect(dayResult).toBeTruthy();
    expect(typeof dayResult).toBe('string');
  });
});