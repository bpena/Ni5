import { Ni5Page } from './app.po';

describe('ni5 App', function() {
  let page: Ni5Page;

  beforeEach(() => {
    page = new Ni5Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
