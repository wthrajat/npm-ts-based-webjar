/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

require(['jquery', 'xwiki-meta'], function($, xm) {
    var solrServiceURL = new XWiki.Document('SuggestSolrService', 'XWiki').getURL('get');
    var data = null;
    var nodeKeyCounter = 1;
    var edgeKeyCounter = 1;
    var openedDocumentReference = xm.document;
    console.log("This is xm.document haha ", xm.document)
  
  
    $.post(solrServiceURL, {
              outputSyntax: 'plain',
              nb: 5000,
              media: 'json',
              query: [
                  'q=*:*',
                  'q.op=AND',
                  'fq=type:DOCUMENT',
                  'fl=title_, reference, links, wiki, spaces, name'
              ].join('\n'),
              input: " "
          }, function(response) {
              tempData = response;
            const nodes = tempData.map(function(obj) {
                  return {
                      key: obj.reference,
                      attributes: {
                          label: obj.title_,
                          color: "#4086ff",
                          reference: obj.reference,
                          pageURL: new XWiki.Document(XWiki.Model.resolve(obj.reference)).getURL()
                      }
                  };
              });
  
              const edges = [];
              tempData.forEach(function(obj) {
                  if (obj.links && obj.links.length > 0) {
                      obj.links.forEach(function(link) {
                          var target = link.replace(/^entity:/, '');
                          var isValid = tempData.some(function(item) {
                              return item.reference === target;
                          });
                          if (isValid) {
                              edges.push({
                                  key: edgeKeyCounter.toString(),
                                  target: target,
                                  source: obj.reference
                              });
                              edgeKeyCounter++;
                          }
                      });
                  }
              });
              const output = {
                  nodes: nodes,
                  edges: edges
              };
  
      console.log("This is the modified data:", output);
  
      // Convert the output to a JSON string
      var jsonData = JSON.stringify(output, null, 2);
  
      // Create a Blob object from the JSON string
      var blob = new Blob([jsonData], { type: 'application/json' });
  
      // Create a URL for the Blob object
      var urlBlob = URL.createObjectURL(blob);
  
      // Open the URL in a new tab/window
      window.open(urlBlob);
    });
  });