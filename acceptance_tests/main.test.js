const request = require('supertest')
const assert = require('assert')

describe('everything', function() {
  
    it('ratings', function() {
        const expected = `\`\`\`
        # |                       |      | Best |   P |   W |     W% | Curr Streak | Best Streak | Pts/Game | 
        1 |           tom.yandell | 2100 | 2129 |  38 |  26 |  68.42 |           0 |           7 |     2.63 | 
        2 |  george.christodoulou | 2091 | 2095 |  19 |  13 |  68.42 |           1 |           6 |     4.79 | 
        3 |                  liam | 2087 | 2087 |   8 |   7 |  87.50 |           7 |           7 |    10.88 | 
        4 |                  jigs | 2071 | 2115 |  21 |  14 |  66.67 |           0 |           4 |     3.38 | 
        5 |         jamie.preddie | 2052 | 2052 |  13 |   8 |  61.54 |           4 |           4 |     4.00 | 
        6 |        akash.kurdekar | 2036 | 2131 |  27 |  17 |  62.96 |           1 |           9 |     1.33 | 
        7 |            tom.coakes | 2017 | 2017 |   3 |   2 |  66.67 |           2 |           2 |     5.67 | 
        8 |          ventsi.mitev | 2016 | 2016 |  14 |   7 |  50.00 |           2 |           3 |     1.14 | 
        9 |      jonathan.hosgood | 2011 | 2011 |   7 |   3 |  42.86 |           2 |           2 |     1.57 | 
       10 |       daniel.alheiros | 2005 | 2025 |   4 |   2 |  50.00 |           0 |           2 |     1.25 | 
       11 |                 tejus | 2001 | 2084 |  17 |   8 |  47.06 |           0 |           3 |     0.06 | 
       12 |          robert.balla | 2000 | 2000 |   0 |   0 |   0.00 |           0 |           0 |     0.00 | 
       13 |             huw.evans | 2000 | 2000 |   0 |   0 |   0.00 |           0 |           0 |     0.00 | 
       14 |                fahric | 2000 | 2000 |   0 |   0 |   0.00 |           0 |           0 |     0.00 | 
       15 |           adam.carter | 1997 | 2014 |   4 |   2 |  50.00 |           0 |           2 |    -0.75 | 
       16 |              johnmuth | 1996 | 2010 |   3 |   1 |  33.33 |           0 |           1 |    -1.33 | 
       17 |              t.valtas | 1988 | 2000 |   1 |   0 |   0.00 |           0 |           0 |   -12.00 | 
       18 |             ben.clark | 1986 | 2000 |   1 |   0 |   0.00 |           0 |           0 |   -14.00 | 
       19 |         aidan.fewster | 1985 | 2000 |   1 |   0 |   0.00 |           0 |           0 |   -15.00 | 
       20 |               sergior | 1984 | 2000 |   1 |   0 |   0.00 |           0 |           0 |   -16.00 | 
       21 |        arthur.gassner | 1963 | 2017 |  14 |   5 |  35.71 |           2 |           2 |    -2.64 | 
       22 |         neil.haggerty | 1952 | 2000 |  17 |   5 |  29.41 |           0 |           2 |    -2.82 | 
       23 |                bijoej | 1914 | 2042 |  16 |   5 |  31.25 |           0 |           2 |    -5.38 | 
       24 |        adrian.muntean | 1882 | 2000 |   9 |   0 |   0.00 |           0 |           0 |   -13.11 | 
       25 |              mohammad | 1866 | 2016 |  16 |   2 |  12.50 |           0 |           1 |    -8.38 | 
      \`\`\``

        return request("http://localhost:2222")
            .get('/slack?user_name=akash.kurdekar&text=ratings')
            .expect(200)
            .then(response => {
                console.log(response.text)
                assert.equal(response.text, expected)
            })
    });
    
});