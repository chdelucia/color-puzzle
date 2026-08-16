import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AppComponent', () => {
  let fixture: any, app: any;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
    app.ngOnInit();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have as title 'app'`, () => {
    expect(app.title).toEqual('Game Of Colors');
  });

  it('should be 9 elements', () => {  
    expect(app.domMatrix.length).toEqual(9);   
  });

  it(`should have 0 'moves'`, () => {
    expect(app.moves).toEqual(0);
  });

  it('should count and save the color', () => {
    app.onClick(2); 
    if (app.moves === 1){
      expect(app.firtItemClicked.color.join()).toEqual(app.domMatrix[2].join())
    }
    expect(app.moves).toEqual(1);
  });

  it('should be Easy LvL', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('select').textContent).toContain('Easy');
  });

  it('should count 2 moves', () => {
    app.domMatrix[2] = [255, 0, 0]; // red
    app.domMatrix[4] = [0, 255, 0]; // green
    app.onClick(2); 
    app.onClick(4);
    expect(app.moves).toEqual(2);
  });

  it('Restart game should count 0 moves', () => {
    app.domMatrix[2] = [255, 0, 0]; // red
    app.domMatrix[4] = [0, 255, 0]; // green
    app.onClick(2); 
    app.onClick(4);
    app.restartGame();
    expect(app.moves).toEqual(0);
  });
});
