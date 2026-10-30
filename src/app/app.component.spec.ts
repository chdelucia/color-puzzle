import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AppComponent', () => {
  let fixture: any, app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Game Of Colors'`, () => {
    expect(app.title).toEqual('Game Of Colors');
  });

  it('should be 9 elements', () => {  
    expect(app.domMatrix().length).toEqual(9);
  });

  it(`should have 0 'moves'`, () => {
    expect(app.moves()).toEqual(0);
  });

  it('should count and save the color', () => {
    app.onClick(2); 
    if (app.moves() === 1) {
      expect(app.firstItemClicked()?.color.join()).toEqual(app.domMatrix()[2].join());
    }
    expect(app.moves()).toEqual(1);
  });

  it('should be Easy LvL', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('select').textContent).toContain('Easy');
  });

  it('should count 2 moves', () => {
    app.domMatrix.update(m => {
      const copy = [...m];
      copy[2] = [255, 0, 0]; // red
      copy[4] = [0, 255, 0]; // green
      return copy;
    });
    app.onClick(2); 
    app.onClick(4);
    expect(app.moves()).toEqual(2);
  });

  it('Restart game should count 0 moves', () => {
    app.domMatrix.update(m => {
      const copy = [...m];
      copy[2] = [255, 0, 0]; // red
      copy[4] = [0, 255, 0]; // green
      return copy;
    });
    app.onClick(2); 
    app.onClick(4);
    app.restartGame();
    expect(app.moves()).toEqual(0);
  });
});
