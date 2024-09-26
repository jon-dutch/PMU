import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const App = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ topic: null, type: null, conference: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/resources.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setResources(data);
        setFilteredResources(data);
        setIsLoading(false);
      } catch (e) {
        console.error("Could not fetch resources:", e);
        setError("Failed to load resources. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const filtered = resources.filter(resource => 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filters.topic || resource.topic === filters.topic) &&
      (!filters.type || resource.type === filters.type) &&
      (!filters.conference || resource.conference === filters.conference)
    );
    setFilteredResources(filtered);
  }, [searchTerm, filters, resources]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const resetFilters = () => {
    setFilters({ topic: null, type: null, conference: null });
    setSearchTerm('');
  };

  const [selectedResource, setSelectedResource] = useState(null);

  const openResource = (resource) => {
    setSelectedResource(resource);
  };

  const renderResourceContent = () => {
    if (!selectedResource) return null;

    switch (selectedResource.type) {
      case 'book':
      case 'article':
        return (
          <iframe 
            src={selectedResource.url} 
            width="100%" 
            height="500px"
            title={selectedResource.title}
          />
        );
      case 'video':
        return (
          <iframe 
            width="560" 
            height="315" 
            src={selectedResource.url} 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            title={selectedResource.title}
          />
        );
      case 'activity':
        return (
          <iframe 
            src={selectedResource.url} 
            width="100%" 
            height="500px"
            title={selectedResource.title}
          />
        );
      default:
        return <p>Unable to display this resource type.</p>;
    }
  };

  const getUniqueValues = (key) => [...new Set(resources.map(item => item[key]))];

  const filterLabels = {
    topic: 'Topic',
    type: 'Type',
    conference: 'Conferences'
  };

  if (isLoading) return <div>Loading resources...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Resource Library</h1>
      
      <div className="mb-4 flex items-center">
        <Search className="w-5 h-5 mr-2 text-gray-500" />
        <Input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex-grow"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        {['topic', 'type', 'conference'].map((filterType) => (
          <DropdownMenu key={filterType}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-32 justify-between">
                <span className="truncate">
                  {filters[filterType] || filterLabels[filterType]}
                </span>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleFilterChange(filterType, null)}>
                All {filterLabels[filterType]}s
              </DropdownMenuItem>
              {getUniqueValues(filterType).map((value) => (
                <DropdownMenuItem key={value} onClick={() => handleFilterChange(filterType, value)}>
                  {value}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
        <Button onClick={resetFilters} className="w-32">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <Card key={resource.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{resource.title}</CardTitle>
              <CardDescription>{resource.topic}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Type: {resource.type}</p>
              <p>Conference: {resource.conference}</p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => openResource(resource)}>View Resource</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{selectedResource?.title}</DialogTitle>
                    <DialogDescription>{selectedResource?.type}</DialogDescription>
                  </DialogHeader>
                  {renderResourceContent()}
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default App;